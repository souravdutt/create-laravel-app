<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use ReflectionNamedType;
use ReflectionProperty;

class GenerateZodSchemas extends Command
{
    protected $signature = 'gen:zod-schemas';
    protected $description = 'Generate Zod schemas from PHP DTOs';

    public function handle(): int
    {
        $this->info('Generating Zod schemas from DTOs...');

        $dtoPath = app_path('DTO');
        if (!File::exists($dtoPath)) {
            $this->error('DTO directory not found!');
            return Command::FAILURE;
        }

        $dtoFiles = File::files($dtoPath);

        foreach ($dtoFiles as $file) {
            $className = 'App\\DTO\\' . $file->getFilenameWithoutExtension();
            
            if (!class_exists($className)) {
                continue;
            }

            $this->generateSchemaForDto($className);
        }

        $this->info('✓ Zod schemas generated successfully!');
        return Command::SUCCESS;
    }

    private function generateSchemaForDto(string $className): void
    {
        $reflection = new ReflectionClass($className);
        $shortName = $reflection->getShortName();

        $constructor = $reflection->getConstructor();
        if (!$constructor) {
            return;
        }

        $properties = $constructor->getParameters();
        $zodFields = [];

        foreach ($properties as $param) {
            $name = $param->getName();
            $type = $param->getType();
            
            if (!$type instanceof ReflectionNamedType) {
                continue;
            }

            $zodType = $this->phpTypeToZod($type, $param->isDefaultValueAvailable());
            $zodFields[] = "  {$name}: {$zodType}";
        }

        $fieldsStr = implode(",\n", $zodFields);

        $content = <<<TS
import { z } from 'zod';

/**
 * Auto-generated from {$className}
 * Do not edit manually - regenerate with: php artisan gen:zod-schemas
 */
export const {$shortName}Schema = z.object({
{$fieldsStr}
});

export type {$shortName} = z.infer<typeof {$shortName}Schema>;
TS;

        $outputPath = resource_path("js/types/{$shortName}.ts");
        File::ensureDirectoryExists(dirname($outputPath));
        File::put($outputPath, $content);

        $this->info("✓ Generated {$shortName}.ts");
    }

    private function phpTypeToZod(ReflectionNamedType $type, bool $hasDefault): string
    {
        $typeName = $type->getName();
        $isNullable = $type->allowsNull();

        $zodType = match ($typeName) {
            'int' => 'z.number().int()',
            'float' => 'z.number()',
            'string' => 'z.string()',
            'bool' => 'z.boolean()',
            'array' => 'z.array(z.any())',
            default => 'z.any()',
        };

        if ($isNullable && !$hasDefault) {
            $zodType .= '.nullable()';
        }

        if ($hasDefault || $isNullable) {
            $zodType .= '.optional()';
        }

        return $zodType;
    }
}
