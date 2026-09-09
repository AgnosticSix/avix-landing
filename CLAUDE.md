@AGENTS.md

# Notas para Claude Code

`AGENTS.md` es la referencia canónica del proyecto: arquitectura, convenciones y
la comprobación de paridad visual. Aquí sólo va lo específico de esta herramienta.

- Antes de dar por terminado un cambio visual, ejecuta la comprobación de
  paridad de `AGENTS.md`. `pnpm build` verde no prueba que el diseño siga bien:
  los fallos de este proyecto han sido silenciosos (un `id` que no se
  renderizaba, un `box-sizing` distinto), no errores de compilación.
- Ejecuta `pnpm check` antes de cerrar cualquier tarea.
- La prosa —comentarios, documentación, mensajes de commit— va en español. Los
  identificadores del código, en inglés.
- `reference/original-site.html` es material de consulta: no lo edites y no lo
  incluyas en búsquedas de código (ya está excluido de ESLint, Prettier y
  TypeScript).
