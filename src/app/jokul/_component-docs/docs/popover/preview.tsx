"use client";
import { Popover } from "@fremtind/jokul/popover";
import { Link } from "@fremtind/jokul/link";

export function PopoverBasicPreview() {
    return (
        <Popover>
            <Popover.Trigger>Vis informasjon</Popover.Trigger>
            <Popover.Content padding={16}>
                <p style={{ margin: 0 }}>Her finner du mer informasjon om dette feltet.</p>
                <Link href="#">Les mer</Link>
            </Popover.Content>
        </Popover>
    );
}
