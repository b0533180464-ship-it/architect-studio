Split a large file into smaller files.

File to split: $ARGUMENTS

Rules:
1. Each new file must be under 100 lines
2. Each function under 20 lines
3. Group related functionality together
4. Create an index.ts to re-export
5. Update all imports in other files

Steps:
1. Analyze the file structure
2. Identify logical groupings
3. Create new files for each group
4. Move code to new files
5. Create index.ts with exports
6. Update imports throughout codebase
7. Verify with typecheck