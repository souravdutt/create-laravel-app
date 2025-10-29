<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;

class GenerateTypescriptClient extends Command
{
    protected $signature = 'gen:ts-client';
    protected $description = 'Generate TypeScript API client from Laravel routes';

    private array $imports = [];
    private array $clientMethods = [];

    public function handle(): int
    {
        $this->info('Generating TypeScript API client...');

        $routes = Route::getRoutes();
        $apiRoutes = collect($routes)->filter(function ($route) {
            return str_starts_with($route->uri(), 'api/');
        });

        foreach ($apiRoutes as $route) {
            $this->processRoute($route);
        }

        $this->generateClientFile();
        $this->info('✓ TypeScript API client generated successfully!');

        return Command::SUCCESS;
    }

    private function processRoute($route): void
    {
        $methods = $route->methods();
        $uri = $route->uri();
        $action = $route->getAction('controller');

        if (!$action) {
            return;
        }

        // Handle both 'Controller@method' and ['Controller', 'method'] formats
        if (is_string($action)) {
            $parts = explode('@', $action);
            $controller = $parts[0];
            $method = $parts[1] ?? 'index';
        } elseif (is_array($action) && count($action) >= 2) {
            [$controller, $method] = $action;
        } else {
            return;
        }
        
        if (!class_exists($controller)) {
            return;
        }

        try {
            $reflection = new ReflectionClass($controller);
            if (!$reflection->hasMethod($method)) {
                return;
            }
            
            $methodReflection = $reflection->getMethod($method);
            $returnType = $this->getReturnType($methodReflection);
            
            foreach ($methods as $httpMethod) {
                if (in_array($httpMethod, ['HEAD', 'OPTIONS'])) continue;
                
                $methodName = $this->generateMethodName($httpMethod, $uri);
                $this->generateClientMethod($methodName, $httpMethod, $uri, $returnType);
            }
        } catch (\Exception $e) {
            $this->warn("Could not process route: {$uri} - " . $e->getMessage());
        }
    }

    private function generateMethodName(string $httpMethod, string $uri): string
    {
        $parts = array_filter(explode('/', $uri));
        $parts = array_map(function ($part) {
            return str_starts_with($part, '{') ? 'By' . ucfirst(trim($part, '{}')) : ucfirst($part);
        }, $parts);
        
        $name = strtolower($httpMethod) . implode('', $parts);
        return lcfirst(str_replace('api', '', ucfirst($name)));
    }

    private function getReturnType(ReflectionMethod $method): array|null
    {
        $returnType = $method->getReturnType();
        
        if (!$returnType instanceof ReflectionNamedType) {
            return null;
        }

        $typeName = $returnType->getName();
        
        // Check if it's a JsonResponse with DTO
        $docComment = $method->getDocComment();
        if ($docComment && preg_match('/@return.*?(\w+Dto)/', $docComment, $matches)) {
            $dtoName = $matches[1];
            $this->imports[$dtoName] = true;
            
            // Check if it's an array return type
            $isArray = str_contains($docComment, 'array<') || str_contains($docComment, '[]');
            return ['type' => $dtoName, 'isArray' => $isArray];
        }

        return null;
    }

    private function generateClientMethod(string $name, string $httpMethod, string $uri, $returnType): void
    {
        $url = '/' . $uri;
        $hasParams = str_contains($uri, '{');
        
        $params = [];
        if ($hasParams) {
            preg_match_all('/\{(\w+)\}/', $uri, $matches);
            $params = $matches[1];
        }

        $hasBody = in_array(strtoupper($httpMethod), ['POST', 'PUT', 'PATCH']);

        $functionParams = [];
        foreach ($params as $param) {
            $functionParams[] = "{$param}: string | number";
        }
        if ($hasBody) {
            $functionParams[] = "data: any";
        }

        $paramsStr = implode(', ', $functionParams);
        
        // Replace route parameters
        $urlTemplate = $url;
        foreach ($params as $param) {
            $urlTemplate = str_replace("{{$param}}", "\${" . $param . "}", $urlTemplate);
        }

        $returnTypeName = is_array($returnType) ? $returnType['type'] : $returnType;
        $isArray = is_array($returnType) ? $returnType['isArray'] : false;
        
        $returnTypeStr = $returnTypeName ? "{$returnTypeName}Schema" : "z.any()";
        if ($isArray && $returnTypeName) {
            $returnTypeStr = "{$returnTypeName}Schema.array()";
        }

        $fetchOptions = [
            "method: '{$httpMethod}'",
        ];

        if ($hasBody) {
            $fetchOptions[] = "headers: { 'Content-Type': 'application/json' }";
            $fetchOptions[] = "body: JSON.stringify(data)";
        }

        $optionsStr = implode(', ', $fetchOptions);

        $method = <<<TS
  {$name}: async ({$paramsStr}) => {
    const res = await fetch(`{$urlTemplate}`, { {$optionsStr} });
    if (!res.ok) throw new Error(`HTTP error! status: \${res.status}`);
    const json = await res.json();
    return {$returnTypeStr}.parse(json);
  }
TS;

        $this->clientMethods[] = $method;
    }

    private function generateClientFile(): void
    {
        $importsStr = '';
        foreach (array_keys($this->imports) as $dtoName) {
            $importsStr .= "import { {$dtoName}Schema } from '../types/{$dtoName}';\n";
        }

        $methodsStr = implode(",\n\n", $this->clientMethods);

        $content = <<<TS
import { z } from 'zod';
{$importsStr}

/**
 * Auto-generated TypeScript API client
 * Do not edit manually - regenerate with: php artisan gen:ts-client
 */
export const api = {
{$methodsStr}
};

export type ApiClient = typeof api;
TS;

        $outputPath = resource_path('js/api/client.ts');
        File::ensureDirectoryExists(dirname($outputPath));
        File::put($outputPath, $content);
    }
}
