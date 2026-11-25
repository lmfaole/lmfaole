"use client"

// The design system's column chart builds its tooltip while it renders, which only the client can: drawn from here, a server page can use it
// (with data and words only; no functions cross over).
export { ColumnChart } from "@lmfaole/designsystem/components/column-chart"
