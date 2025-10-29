<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class TypeScriptWatch extends Command
{
    protected $signature = 'typescript:watch';
    protected $description = 'Watch DTOs and regenerate TypeScript types on changes';

    public function handle(): int
    {
        $this->info('Starting TypeScript watch mode...');
        $this->info('Watching app/DTO/ for changes...');
        
        // Initial generation
        $this->call('typescript:transform');
        $this->call('gen:zod-schemas');
        $this->call('gen:ts-client');

        $lastHash = $this->getDirectoryHash();

        while (true) {
            sleep(2);
            
            $currentHash = $this->getDirectoryHash();
            
            if ($currentHash !== $lastHash) {
                $this->info('Changes detected, regenerating...');
                
                $this->call('typescript:transform');
                $this->call('gen:zod-schemas');
                $this->call('gen:ts-client');
                
                $this->info('✓ Regenerated successfully!');
                $lastHash = $currentHash;
            }
        }

        return Command::SUCCESS;
    }

    private function getDirectoryHash(): string
    {
        $dtoPath = app_path('DTO');
        $files = glob($dtoPath . '/*.php');
        
        $hash = '';
        foreach ($files as $file) {
            $hash .= md5_file($file);
        }
        
        return md5($hash);
    }
}
