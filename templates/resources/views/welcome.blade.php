<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>S6 Stack - Laravel + TypeScript</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-gradient-to-br from-gray-900 via-blue-900 to-sky-900 min-h-screen">
    <div id="app"></div>
</body>
</html>
