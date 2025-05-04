# Example PowerShell script to install Node.js
$nodejsUrl = "https://nodejs.org/dist/v16.17.0/node-v16.17.0-x64.msi"
$installerPath = "$env:TEMP\nodejs-installer.msi"
Invoke-WebRequest -Uri $nodejsUrl -OutFile $installerPath
Start-Process -FilePath $installerPath -ArgumentList '/quiet' -Wait
node -v
npm -v
Remove-Item -Path $installerPath
