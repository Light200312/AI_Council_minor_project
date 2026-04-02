/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-frontend-to-backend',
      comment: 'Frontend code must stay isolated from server-side modules.',
      severity: 'error',
      from: { path: '^frontend/src' },
      to: { path: '^backend' },
    },
    {
      name: 'no-routes-to-db',
      comment: 'Routes should go through services/models, not reach into DB config directly.',
      severity: 'error',
      from: { path: '^backend/routes' },
      to: { path: '^backend/DB' },
    },
    {
      name: 'no-routes-to-services-internals',
      comment: 'Routes should not depend on low-level infrastructure helpers or scripts.',
      severity: 'warn',
      from: { path: '^backend/routes' },
      to: { path: '^backend/(scripts|DB)' },
    },
    {
      name: 'no-models-to-routes',
      comment: 'Persistence models must not depend on HTTP routing.',
      severity: 'error',
      from: { path: '^backend/models' },
      to: { path: '^backend/routes' },
    },
    {
      name: 'no-circular',
      comment: 'Circular dependencies make the graph harder to reason about.',
      severity: 'warn',
      from: {},
      to: { circular: true },
    }
  ],
  options: {
    tsPreCompilationDeps: false,
    enhancedResolveOptions: {
      extensions: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']
    },
    doNotFollow: {
      path: 'node_modules'
    },
    exclude: {
      path: '(^|/)(node_modules|dist|coverage)(/|$)'
    },
    includeOnly: '^((frontend/src)|backend)',
    reporterOptions: {
      dot: {
        collapsePattern: '^(frontend/src/components/ui|frontend/src/components|frontend/src/lib|frontend/src/store|frontend/src/data|backend/routes|backend/services|backend/models|backend/middleware|backend/utils|backend/DB)(/|$)'
      }
    }
  }
};
