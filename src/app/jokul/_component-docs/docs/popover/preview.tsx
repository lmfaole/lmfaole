"use client";
import {useState} from "react";
import {Popover} from "@fremtind/jokul/popover";
import {Button} from "@fremtind/jokul/button";
import {Link} from "@fremtind/jokul/link";

export function PopoverTriggerPreview() {
    return <PopoverBasicPreview/>;
}

export function PopoverContentPreview() {
    const [open, setOpen] = useState(true);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <Button variant="secondary">Vis informasjon</Button>
            </Popover.Trigger>
            <Popover.Content padding={16}>
                <p style={{margin: 0}}>Her finner du mer informasjon om dette feltet.</p>
            </Popover.Content>
        </Popover>
    );
}

export function PopoverBasicPreview() {
    return (
        <Popover>
            <Popover.Trigger asChild>
                <Button variant="secondary">Vis informasjon</Button>
            </Popover.Trigger>
            <Popover.Content padding={16}>
                <p style={{margin: 0}}>Her finner du mer informasjon om dette feltet.</p>
                <Link href="#">Les mer</Link>
            </Popover.Content>
        </Popover>
    );
}
