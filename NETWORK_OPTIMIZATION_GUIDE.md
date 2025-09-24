# Guía de Optimización de Red - Raquet Power 2.0

## Problema Resuelto

Se han solucionado los errores de red que causaban:
- `ERR_INSUFFICIENT_RESOURCES`
- `Network Error`
- Múltiples solicitudes simultáneas fallidas

## Optimizaciones Implementadas

### 1. Frontend (React/Next.js)

#### Componente TournamentParticipants Optimizado
- **Control de solicitudes simultáneas**: Uso de `useRef` para prevenir múltiples requests
- **Cancelación de requests**: Implementación de `AbortController` para cancelar solicitudes pendientes
- **Debouncing**: Retraso de 100ms para prevenir llamadas rápidas sucesivas
- **Manejo de errores mejorado**: Mejor gestión de errores de red y timeouts

#### Axios Optimizado (`src/lib/axios.ts`)
- **Timeout configurado**: 10 segundos para evitar requests colgados
- **Deduplicación de requests GET**: Previene solicitudes duplicadas
- **Retry logic**: Reintento automático para errores de red (máximo 2 intentos)
- **Request queue**: Cola de solicitudes para evitar sobrecarga
- **Manejo mejorado de errores**: Mensajes específicos para diferentes tipos de error

### 2. Backend (Laravel/PHP)

#### Configuración PHP Optimizada (`backend/php.ini`)
- **Memoria aumentada**: `memory_limit = 256M`
- **Timeouts configurados**: `max_execution_time = 60`
- **OPcache habilitado**: Mejor rendimiento de PHP
- **Límites de conexión optimizados**: `max_input_vars = 3000`

#### Script de Inicio Optimizado (`backend/start-server.sh`)
- **Limpieza automática**: Mata procesos existentes en puerto 8001
- **Cache clearing**: Limpia caches de Laravel antes de iniciar
- **Configuración personalizada**: Usa el php.ini optimizado

#### Controladores Optimizados
- **TournamentController**: Carga relaciones de participantes dinámicamente
- **TournamentParticipantController**: Actualización precisa de contadores
- **Comando de sincronización**: `php artisan tournaments:sync-participants`

## Cómo Usar las Optimizaciones

### Iniciar el Servidor Backend
```bash
cd backend
./start-server.sh
```

### Verificar Estado del Servidor
```bash
# Verificar procesos en puerto 8001
lsof -ti:8001

# Matar procesos si es necesario
lsof -ti:8001 | xargs kill -9
```

### Sincronizar Contadores de Participantes
```bash
cd backend
php artisan tournaments:sync-participants
```

## Características de las Optimizaciones

### Prevención de Errores de Red
1. **Request Deduplication**: Evita solicitudes GET duplicadas
2. **Abort Controller**: Cancela requests pendientes al desmontar componentes
3. **Timeout Management**: Evita requests que se cuelgan indefinidamente
4. **Retry Logic**: Reintenta automáticamente en caso de errores temporales

### Mejor Rendimiento
1. **PHP OPcache**: Acelera la ejecución de código PHP
2. **Laravel Cache**: Optimiza rutas y configuración
3. **Memory Optimization**: Configuración de memoria adecuada para desarrollo
4. **Connection Pooling**: Mejor manejo de conexiones concurrentes

### Experiencia de Usuario Mejorada
1. **Loading States**: Indicadores de carga apropiados
2. **Error Messages**: Mensajes de error más descriptivos
3. **Automatic Refresh**: Actualización automática de datos
4. **Debounced Requests**: Previene spam de solicitudes

## Monitoreo y Debugging

### Logs del Frontend
Los requests se logean en la consola del navegador con emojis para fácil identificación:
- 🌐 Request iniciado
- ✅ Request exitoso
- 🚨 Error de API
- 🔄 Request duplicado (deduplicado)

### Logs del Backend
Los errores PHP se guardan en:
```
backend/storage/logs/php_errors.log
```

### Verificar Configuración PHP
```bash
cd backend
php -c php.ini -m | grep opcache
```

## Solución de Problemas

### Si sigues viendo errores de red:
1. **Reinicia el servidor backend**:
   ```bash
   cd backend
   ./start-server.sh
   ```

2. **Limpia el cache del navegador**:
   - Ctrl+Shift+R (Chrome/Firefox)
   - Cmd+Shift+R (Mac)

3. **Verifica la configuración de red**:
   ```bash
   curl -I http://localhost:8001/api/test
   ```

4. **Revisa los logs**:
   ```bash
   tail -f backend/storage/logs/laravel.log
   tail -f backend/storage/logs/php_errors.log
   ```

### Si el contador de participantes no se actualiza:
```bash
cd backend
php artisan tournaments:sync-participants
```

## Configuración de Producción

Para producción, considera:
1. **Usar un servidor web real** (Apache/Nginx)
2. **Configurar PHP-FPM** para mejor manejo de concurrencia
3. **Implementar Redis** para cache y sesiones
4. **Configurar load balancing** si es necesario

## Archivos Modificados

### Frontend
- `src/components/tournaments/TournamentParticipants.tsx`
- `src/lib/axios.ts`

### Backend
- `backend/app/Http/Controllers/TournamentController.php`
- `backend/app/Http/Controllers/TournamentParticipantController.php`
- `backend/app/Console/Commands/SyncTournamentParticipants.php`
- `backend/php.ini` (nuevo)
- `backend/start-server.sh` (nuevo)

## Resultados Esperados

Después de implementar estas optimizaciones:
- ✅ No más errores `ERR_INSUFFICIENT_RESOURCES`
- ✅ Carga rápida de participantes de torneos
- ✅ Actualización correcta de contadores (ej: "2/32" en lugar de "0/32")
- ✅ Mejor rendimiento general de la aplicación
- ✅ Experiencia de usuario más fluida

---

**Nota**: Estas optimizaciones están diseñadas para el entorno de desarrollo. Para producción, se recomiendan configuraciones adicionales de servidor web y base de datos.