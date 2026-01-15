# Cómo Eliminar Ramas en Git

Esta guía explica cómo eliminar ramas en Git de forma segura, tanto localmente como en el repositorio remoto.

## 📋 Índice

- [Eliminar Rama Local](#eliminar-rama-local)
- [Eliminar Rama Remota](#eliminar-rama-remota)
- [Eliminar Ambas (Local y Remota)](#eliminar-ambas-local-y-remota)
- [Precauciones](#precauciones)
- [Solución de Problemas](#solución-de-problemas)

## 🗑️ Eliminar Rama Local

Para eliminar una rama **local** que ya ha sido fusionada (merged):

```bash
git branch -d nombre-de-la-rama
```

**Ejemplo:**
```bash
git branch -d copilot/eliminar-rama
```

### Forzar la Eliminación (rama no fusionada)

Si la rama NO ha sido fusionada y estás seguro de que quieres eliminarla:

```bash
git branch -D nombre-de-la-rama
```

⚠️ **Advertencia**: Usar `-D` (mayúscula) eliminará la rama aunque tenga cambios no fusionados.

## 🌐 Eliminar Rama Remota

Para eliminar una rama del repositorio **remoto** (por ejemplo, GitHub):

```bash
git push origin --delete nombre-de-la-rama
```

**Ejemplo:**
```bash
git push origin --delete copilot/eliminar-rama
```

### Sintaxis Alternativa

También puedes usar esta sintaxis:

```bash
git push origin :nombre-de-la-rama
```

## 🔄 Eliminar Ambas (Local y Remota)

Para eliminar una rama completamente (local y remota):

```bash
# 1. Eliminar rama remota
git push origin --delete nombre-de-la-rama

# 2. Eliminar rama local
git branch -d nombre-de-la-rama
```

**Ejemplo completo:**
```bash
# Asegúrate de estar en otra rama (no en la que vas a eliminar)
git checkout main

# Eliminar rama remota
git push origin --delete copilot/eliminar-rama

# Eliminar rama local
git branch -d copilot/eliminar-rama
```

## ⚠️ Precauciones

### No Puedes Eliminar la Rama Actual

Si intentas eliminar la rama en la que estás trabajando actualmente, obtendrás un error:

```bash
error: Cannot delete branch 'copilot/eliminar-rama' checked out at '...'
```

**Solución**: Cambia a otra rama primero:

```bash
git checkout main
# o
git checkout master
```

### Verificar Ramas Antes de Eliminar

Lista todas las ramas para confirmar:

```bash
# Ramas locales
git branch

# Ramas remotas
git branch -r

# Todas las ramas
git branch -a
```

### Verificar Estado de Fusión

Para verificar si una rama ha sido fusionada:

```bash
# Ramas fusionadas en la rama actual
git branch --merged

# Ramas NO fusionadas
git branch --no-merged
```

## 🔧 Solución de Problemas

### "Cannot delete branch" - Rama no fusionada

```bash
error: The branch 'nombre-rama' is not fully merged.
```

**Opciones:**

1. **Fusionar primero** (recomendado):
   ```bash
   git checkout main
   git merge nombre-rama
   git branch -d nombre-rama
   ```

2. **Forzar eliminación** (si estás seguro):
   ```bash
   git branch -D nombre-rama
   ```

### Limpiar Referencias Remotas Obsoletas

Si eliminaste una rama remota pero aún aparece al ejecutar `git branch -r`:

```bash
git fetch --prune
# o
git remote prune origin
```

### Recuperar una Rama Eliminada Accidentalmente

Si eliminaste una rama por error y aún no has ejecutado `git gc`:

```bash
# 1. Buscar el último commit de la rama
git reflog

# 2. Recrear la rama desde ese commit
git checkout -b nombre-rama <commit-hash>
```

## 📝 Resumen de Comandos

| Acción | Comando |
|--------|---------|
| Eliminar rama local (fusionada) | `git branch -d nombre-rama` |
| Eliminar rama local (forzar) | `git branch -D nombre-rama` |
| Eliminar rama remota | `git push origin --delete nombre-rama` |
| Listar ramas locales | `git branch` |
| Listar ramas remotas | `git branch -r` |
| Cambiar de rama | `git checkout otra-rama` |
| Limpiar referencias remotas | `git fetch --prune` |

## 🎯 Ejemplo Práctico Completo

Supongamos que terminaste de trabajar en la rama `feature/nueva-funcionalidad` y quieres eliminarla:

```bash
# 1. Asegurarte de que los cambios están en main
git checkout main
git pull origin main

# 2. Verificar que la rama fue fusionada
git branch --merged

# 3. Eliminar rama local
git branch -d feature/nueva-funcionalidad

# 4. Eliminar rama remota
git push origin --delete feature/nueva-funcionalidad

# 5. Limpiar referencias
git fetch --prune
```

---

**Nota**: Siempre verifica que la rama que vas a eliminar no contiene trabajo importante antes de proceder.
