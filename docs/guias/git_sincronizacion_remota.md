# Guía de Sincronización con Repositorios Remotos en Git

## Conceptos Clave

### El Problema Común
Git **no sincroniza automáticamente** con el servidor remoto. Tu repositorio local solo conoce los commits que existían la última vez que ejecutaste `fetch` o `pull`.

```
GitHub (remoto)                    Tu PC (local)
┌─────────────────────┐            ┌─────────────────────┐
│ commit xyz ← EXISTE │            │ commit xyz ← ???    │
│ (archivo nuevo)     │            │ (no lo conoce)      │
└─────────────────────┘            └─────────────────────┘
```

---

## Comandos Esenciales

### 1. `git fetch` - Actualizar Referencias

```bash
git fetch origin              # Descarga referencias de 'origin'
git fetch --all               # Descarga de TODOS los remotos
```

**¿Qué hace?**
- Descarga commits, ramas y tags nuevos del servidor
- **NO modifica** tu código ni tu rama actual
- Solo actualiza las "referencias remotas" (`origin/rama`)

**¿Cuándo usarlo?**
- Antes de buscar commits que sabes que existen en GitHub
- Antes de comparar tu rama con la versión remota
- Periódicamente para mantener tu repositorio actualizado

---

### 2. `git pull` - Descargar y Fusionar

```bash
git pull origin nombre-rama
```

**¿Qué hace?**
- Ejecuta `fetch` + `merge` en un solo comando
- Actualiza tu rama actual con los cambios remotos

**¿Cuándo usarlo?**
- Cuando quieres incorporar cambios del remoto a tu rama actual

---

### 3. `git cherry-pick` - Traer Commits Específicos

```bash
git cherry-pick <hash-del-commit>
```

**¿Qué hace?**
- Copia UN commit específico a tu rama actual
- Crea un nuevo commit con el mismo contenido pero diferente hash

**¿Cuándo usarlo?**
- Cuando solo necesitas un commit específico de otra rama
- Para evitar traer cambios no deseados de un merge completo

---

## Flujo de Trabajo Recomendado

### Antes de buscar commits remotos:

```bash
# 1. Actualizar referencias (SIEMPRE hacer esto primero)
git fetch --all

# 2. Ver los commits de una rama remota
git log origin/nombre-rama --oneline -10

# 3. Ver diferencias entre tu rama y la remota
git diff tu-rama..origin/otra-rama --name-status
```

### Para traer cambios específicos:

```bash
# Opción A: Cherry-pick (solo un commit)
git cherry-pick <hash>

# Opción B: Merge (todos los cambios de la rama)
git merge origin/otra-rama
```

### Después de hacer cambios:

```bash
git push origin tu-rama
```

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `fatal: bad object <hash>` | El commit no existe localmente | `git fetch --all` y reintentar |
| `branch not found` | La rama no ha sido descargada | `git fetch origin nombre-rama` |
| Rama remota desactualizada | No has hecho fetch recientemente | `git fetch --all` |

---

## Diagrama: Local vs Remoto

```
┌─────────────────────────────────────────────────────────────┐
│                     TU REPOSITORIO                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   origin/main ──────────┐                                   │
│   (referencia remota)   │                                   │
│                         ▼                                   │
│                    ┌─────────┐     ┌─────────┐              │
│                    │ fetch   │────▶│ merge   │              │
│                    └─────────┘     └─────────┘              │
│                         │               │                   │
│                         │               ▼                   │
│                         │          main (local)             │
│                         │          (tu trabajo)             │
│                         │                                   │
│   ◄─────────────────────┴─── git pull = fetch + merge       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ push
                              ▼
                    ┌─────────────────────┐
                    │   GitHub (remoto)   │
                    └─────────────────────┘
```

---

## Regla de Oro

> **Siempre ejecuta `git fetch` antes de buscar commits o ramas que sabes que existen en el servidor remoto.**

El repositorio local y el remoto son **independientes**. Tu PC no sabe que hay commits nuevos en GitHub hasta que se lo preguntas con `fetch`.

---

## Referencias Adicionales

- [Git Documentation - fetch](https://git-scm.com/docs/git-fetch)
- [Git Documentation - cherry-pick](https://git-scm.com/docs/git-cherry-pick)
- [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)
