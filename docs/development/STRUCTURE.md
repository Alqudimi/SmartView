# Code Structure & Folder Hierarchy

Understanding the repository layout.

```text
/app/applet
├── .env.example          # Environment variables template
├── build_apk_colab.sh # Automated cloud build script
├── package.json          # Node dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript compiler options
├── src/                  # Main Source Directory
│   ├── App.tsx           # Orchestration, state, and UI components
│   ├── index.css         # Global Tailwind directives
│   ├── main.tsx          # React DOM entry point
│   └── vite-env.d.ts     # Vite environment types
├── docs/                 # Enterprise Documentation Ecosystem
│   ├── architecture/     # ADRs and system design
│   ├── deployment/       # Build and CI/CD guides
│   ├── development/      # Engineering standards
│   ├── guides/           # User and config guides
│   ├── security/         # Security policies
│   ├── testing/          # Testing strategy
│   └── troubleshooting/  # FAQs and issue resolution
└── wiki/                 # Cross-linked knowledge base
```

## Component Modularity Note
Currently, `App.tsx` houses the majority of the UI views (`ReceiverHome`, `SenderHome`, etc.). Future refactoring should extract these into a `/src/components/` directory as the project scales.
