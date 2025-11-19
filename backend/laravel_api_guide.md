
# Guía Completa de Implementación Backend (Laravel + MySQL)

Sigue estos pasos estrictamente para crear el proyecto backend separado.

## Paso 1: Preparar el Proyecto Laravel

Abre tu terminal, sal de la carpeta del frontend y ejecuta:

```bash
# 1. Crear proyecto (asegúrate de tener PHP y Composer instalados)
composer create-project laravel/laravel backend

# 2. Entrar a la carpeta
cd backend

# 3. Instalar API y Sanctum (para autenticación y tokens)
php artisan install:api
```

## Paso 2: Configurar Base de Datos

1.  Abre tu gestor de base de datos (phpMyAdmin, MySQL Workbench, etc.).
2.  Ejecuta todo el contenido del archivo `backend/schema.sql` que te he proporcionado. Esto creará la base de datos `inventory_db` y las tablas.
3.  Abre el archivo `.env` en la carpeta `backend/` y configura la conexión:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory_db
DB_USERNAME=tu_usuario_mysql  (normalmente 'root')
DB_PASSWORD=tu_password_mysql (a veces vacío '')
```

## Paso 3: Configurar CORS (¡MUY IMPORTANTE!)

Para que tu Frontend (React) pueda hablar con el Backend, debes permitir el acceso.

1.  Abre `backend/config/cors.php` (o publica la configuración si no existe).
2.  Busca `allowed_origins` y cámbialo para permitir tu frontend local:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'], // Agrega el puerto donde corre tu React
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true, // Importante si usas cookies, pero con tokens Bearer es opcional
```

## Paso 4: Crear Modelos y Migraciones

Aunque ya creamos las tablas con SQL, Laravel necesita los Modelos para funcionar. Ejecuta:

```bash
php artisan make:model Departamento
php artisan make:model Puesto
php artisan make:model TipoEquipo
php artisan make:model Equipo
php artisan make:model HistorialMovimiento
php artisan make:model Mantenimiento
php artisan make:model TipoLicencia
php artisan make:model Licencia
php artisan make:model Notificacion
```

Luego, edita `App\Models\Equipo.php` (ejemplo) para definir relaciones:

```php
class Equipo extends Model {
    protected $guarded = []; // Permite asignación masiva

    public function tipo_equipo() { return $this->belongsTo(TipoEquipo::class); }
    public function responsable() { return $this->belongsTo(User::class, 'responsable_id'); }
}
```

Repite esto para las relaciones definidas en el `schema.sql`.

## Paso 5: Crear Controladores

```bash
php artisan make:controller AuthController
php artisan make:controller DepartamentoController --api
php artisan make:controller PuestoController --api
php artisan make:controller UserController --api
php artisan make:controller EquipoController --api
php artisan make:controller TipoEquipoController --api
php artisan make:controller LicenciaController --api
php artisan make:controller ReportController
```

**Ejemplo clave: AuthController (Login)**

```php
// app/Http/Controllers/AuthController.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

public function login(Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (Auth::attempt($credentials)) {
        $user = Auth::user();
        // Crear token para el frontend
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Cargar relaciones necesarias para el frontend
        $user->load('departamento', 'puesto');

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    return response()->json(['message' => 'Credenciales inválidas'], 401);
}
```

## Paso 6: Rutas (routes/api.php)

Copia el siguiente contenido en `backend/routes/api.php`:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\PuestoController;
use App\Http\Controllers\TipoEquipoController;
use App\Http\Controllers\LicenciaController;

// Login Público
Route::post('/login', [AuthController::class, 'login']);

// Rutas Protegidas
Route::middleware('auth:sanctum')->group(function () {
    
    // Usuarios y Perfil
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::apiResource('users', UserController::class);

    // Organización
    Route::apiResource('departamentos', DepartamentoController::class);
    Route::apiResource('puestos', PuestoController::class);
    
    // Equipos
    Route::apiResource('tipos-equipo', TipoEquipoController::class);
    Route::apiResource('equipos', EquipoController::class);
    
    // Acciones Custom de Equipos (Mapeadas desde liveApi.ts)
    Route::post('/equipos/{id}/asignar', [EquipoController::class, 'asignar']);
    Route::post('/equipos/{id}/recepcionar', [EquipoController::class, 'recepcionar']);
    Route::post('/equipos/{id}/baja', [EquipoController::class, 'darBaja']);
    Route::post('/equipos/{id}/mantenimiento', [EquipoController::class, 'enviarMantenimiento']);
    Route::post('/equipos/{id}/finalizar-mantenimiento', [EquipoController::class, 'finalizarMantenimiento']);
    
    // Licencias
    Route::apiResource('tipos-licencia', LicenciaController::class); // Ajustar Controller si separas tipos
    Route::apiResource('licencias', LicenciaController::class);
    Route::post('/licencias/stock', [LicenciaController::class, 'addStock']);
    Route::post('/licencias/{id}/asignar', [LicenciaController::class, 'asignar']);
    Route::post('/licencias/{id}/liberar', [LicenciaController::class, 'liberar']);
    
    // Reportes (Implementar lógica de consultas en ReportController)
    Route::get('/stats/dashboard', [ReportController::class, 'dashboardStats']);
    Route::get('/stats/garantias', [ReportController::class, 'warrantyReport']);
    Route::get('/stats/reemplazos', [ReportController::class, 'replacementCandidates']);
    
    // Historiales
    Route::get('/historial/movimientos', [ReportController::class, 'movementHistory']);
    Route::get('/historial/asignaciones', [ReportController::class, 'assignmentHistory']);
    Route::get('/historial/mantenimientos', [ReportController::class, 'maintenanceHistory']);
    
    // Notificaciones
    Route::get('/notificaciones', function() { return []; }); // Placeholder
});
```

## Paso 7: Ejecutar

1.  En la terminal de `backend/`:
    ```bash
    php artisan serve
    ```
    Esto iniciará el servidor en `http://localhost:8000`.

2.  En tu frontend (archivo `services/mockApi.ts`), cambia:
    ```typescript
    const USE_LIVE_API = true;
    ```

¡Listo! Tu frontend React ahora consumirá datos reales de Laravel y MySQL.
