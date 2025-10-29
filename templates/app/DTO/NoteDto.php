<?php

namespace App\DTO;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NoteDto
{
    public function __construct(
        public int $id,
        public string $content,
        public ?string $created_at = null
    ) {}
}
