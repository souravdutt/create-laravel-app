<?php

namespace App\DTO;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserDto
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public ?string $email_verified_at = null,
        public ?string $created_at = null,
    ) {}
}
