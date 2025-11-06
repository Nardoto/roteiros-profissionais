@echo off
echo.
echo ========================================
echo   PUSH PARA GITHUB
echo ========================================
echo.

REM Verificar se o repositório remoto já existe
git remote -v | findstr "origin" >nul 2>&1
if %errorlevel% equ 0 (
    echo Repositorio remoto ja configurado!
    echo.
    git remote -v
    echo.
) else (
    echo Nenhum repositorio remoto configurado.
    echo.
    set /p GITHUB_USER="Digite seu username do GitHub: "
    echo.
    echo Adicionando remote...
    git remote add origin https://github.com/!GITHUB_USER!/gerador-roteiros-biblicos.git
    echo.
)

echo Renomeando branch para main...
git branch -M main

echo.
echo Fazendo push...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Codigo enviado ao GitHub!
    echo ========================================
    echo.
    echo Proximo passo: Deploy na Vercel
    echo Acesse: https://vercel.com/new
    echo.
) else (
    echo.
    echo ========================================
    echo   ERRO ao fazer push!
    echo ========================================
    echo.
    echo Possíveis solucoes:
    echo 1. Crie o repositorio no GitHub primeiro: https://github.com/new
    echo 2. Use Personal Access Token ao inves de senha
    echo 3. Configure SSH key
    echo.
    echo Mais detalhes em: DEPLOY_GITHUB.md
    echo.
)

pause
