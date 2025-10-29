<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Collectors
    |--------------------------------------------------------------------------
    */
    'collectors' => [
        Spatie\TypeScriptTransformer\Collectors\DefaultCollector::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto discover types
    |--------------------------------------------------------------------------
    */
    'auto_discover_types' => [
        app_path('DTO'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Transformers
    |--------------------------------------------------------------------------
    */
    'transformers' => [
        Spatie\TypeScriptTransformer\Transformers\DtoTransformer::class,
        Spatie\TypeScriptTransformer\Transformers\MyclabsEnumTransformer::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Output file
    |--------------------------------------------------------------------------
    */
    'output_file' => resource_path('js/types/generated.d.ts'),
];
