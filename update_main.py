import os,glob
files=sorted(glob.glob("src/styles/sections/*.css"))
imports="\n".join("import './styles/sections/%s';" % os.path.basename(f) for f in files)
content="import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { App } from './App';\n"+imports+"\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n"
open("src/main.tsx","w",encoding="utf-8").write(content)
print("done")
