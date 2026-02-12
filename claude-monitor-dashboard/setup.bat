@echo off
echo ================================
echo Claude Monitor Dashboard Setup
echo ================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Building project...
call npm run build

echo.
echo [3/4] Setup complete!
echo.
echo ================================
echo Next Steps:
echo ================================
echo.
echo 1. Start MCP Server (Terminal 1):
echo    npm run mcp-server
echo.
echo 2. Start Dashboard (Terminal 2):
echo    npm run dev
echo.
echo 3. Configure Claude Desktop:
echo    Edit: %%APPDATA%%\Claude\claude_desktop_config.json
echo    Add MCP server configuration (see README.md)
echo.
echo 4. Open browser:
echo    http://localhost:3000
echo.
echo ================================
echo.
pause
