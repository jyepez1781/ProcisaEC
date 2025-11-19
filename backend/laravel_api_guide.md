
# Guía de Implementación Backend Laravel

Esta guía asume que has creado un proyecto Laravel (`composer create-project laravel/laravel backend`).

## 1. Modelos (App/Models)

Debes crear los modelos correspondientes a las tablas con sus relaciones (`belongsTo`, `hasMany`).

*   **User**: `hasOne(Departamento)`, `hasOne(Puesto)`, `hasMany(Equipo)` (como responsable).
*   **Equipo**: `belongsTo(TipoEquipo)`, `belongsTo(User)`, `hasMany(Mantenimiento)`, `hasMany(HistorialMovimiento)`.
*   **Licencia**: `belongsTo(TipoLicencia)`, `belongsTo(User)`.

## 2. Rutas API (routes/api.php)

Copia esta estructura en tu archivo de rutas. Usa `Sanctum` para autenticación.

```php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\UserController;
// ... importa tus controladores

// Auth
Route::post('/login', [AuthController::class, 'login']);

// Rutas Protegidas
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // Organización
    Route::apiResource('departamentos', DepartamentoController::class);
    Route::apiResource('puestos', PuestoController::class);
    
    // Usuarios
    Route::apiResource('users', UserController::class);
    
    // Equipos
    Route::apiResource('tipos-equipo', TipoEquipoController::class);
    Route::apiResource('equipos', EquipoController::class);
    
    // Acciones Específicas de Equipos
    Route::post('/equipos/{id}/asignar', [EquipoController::class, 'asignar']);
    Route::post('/equipos/{id}/recepcionar', [EquipoController::class, 'recepcionar']);
    Route::post('/equipos/{id}/baja', [EquipoController::class, 'darBaja']);
    Route::post('/equipos/{id}/mantenimiento', [EquipoController::class, 'enviarMantenimiento']);
    Route::post('/equipos/{id}/finalizar-mantenimiento', [EquipoController::class, 'finalizarMantenimiento']);
    
    // Licencias
    Route::apiResource('tipos-licencia', TipoLicenciaController::class);
    Route::apiResource('licencias', LicenciaController::class);
    Route::post('/licencias/stock', [LicenciaController::class, 'addStock']);
    Route::post('/licencias/{id}/asignar', [LicenciaController::class, 'asignar']);
    Route::post('/licencias/{id}/liberar', [LicenciaController::class, 'liberar']);
    
    // Reportes y Stats
    Route::get('/stats/dashboard', [ReportController::class, 'dashboardStats']);
    Route::get('/stats/garantias', [ReportController::class, 'warrantyReport']);
    Route::get('/stats/reemplazos', [ReportController::class, 'replacementCandidates']);
    Route::get('/historial/movimientos', [ReportController::class, 'movementHistory']);
    Route::get('/historial/asignaciones', [ReportController::class, 'assignmentHistory']);
    Route::get('/historial/mantenimientos', [ReportController::class, 'maintenanceHistory']);
    Route::get('/notificaciones', [NotificationController::class, 'index']);
});
```

## 3. Notas de Implementación de Controladores

Cuando implementes los controladores, asegúrate de devolver JSON en el formato que espera el Frontend (ver `types.ts` y `services/liveApi.ts`).

Ejemplo de respuesta de Equipo con relaciones:

```php
// EquipoController.php
public function index() {
    return Equipo::with(['tipo_equipo', 'ubicacion', 'responsable', 'responsable.departamento'])->get()->map(function($e) {
        return [
            'id' => $e->id,
            'codigo_activo' => $e->codigo_activo,
            // ... mapear campos
            'tipo_nombre' => $e->tipo_equipo->nombre,
            'responsable_nombre' => $e->responsable ? $e->responsable->nombre_completo : null,
        ];
    });
}
```
