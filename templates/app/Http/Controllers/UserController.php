<?php

namespace App\Http\Controllers;

use App\DTO\UserDto;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * @return JsonResponse<array<UserDto>>
     */
    public function index(): JsonResponse
    {
        $users = User::all()->map(function ($user) {
            return new UserDto(
                id: $user->id,
                name: $user->name,
                email: $user->email,
                email_verified_at: $user->email_verified_at?->toISOString(),
                created_at: $user->created_at?->toISOString(),
            );
        });

        return response()->json($users);
    }

    /**
     * @return JsonResponse<UserDto>
     */
    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $dto = new UserDto(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            email_verified_at: $user->email_verified_at?->toISOString(),
            created_at: $user->created_at?->toISOString(),
        );

        return response()->json($dto);
    }
}
