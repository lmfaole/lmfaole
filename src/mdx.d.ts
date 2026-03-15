declare module "*.mdx" {
    import type React from "react";
    const MDXComponent: (props: React.ComponentProps<"div"> & Record<string, unknown>) => React.ReactElement;
    export default MDXComponent;
}

