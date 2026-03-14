import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
    {
                title: "Inline-lenke",
                description: "Link brukt inline i et avsnitt.",
                code: `<p>
      Les mer om <Link href="/forsikring">våre forsikringstjenester</Link>.
    </p>`,
                preview: (
                    <p>
                        Les mer om <Link href="/forsikring">våre forsikringstjenester</Link>.
                    </p>
                ),
            },
    {
                title: "Frittstående lenke",
                description: "Link som frittstående element.",
                code: `<Flex direction="column" gap="xs">
      <Link href="/om-oss">Om oss</Link>
      <Link href="/kontakt">Kontakt oss</Link>
      <Link href="https://fremtind.no" external>Fremtind.no</Link>
    </Flex>`,
                preview: (
                    <Flex direction="column" gap="xs">
                        <Link href="/om-oss">Om oss</Link>
                        <Link href="/kontakt">Kontakt oss</Link>
                        <Link href="https://fremtind.no" external>Fremtind.no</Link>
                    </Flex>
                ),
            }
];
