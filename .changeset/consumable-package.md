---
"@sagui/ui": patch
---

Bundle the motion tokens into the build, so apps outside this monorepo can install `@sagui/ui` without transpiling `@sagui/tokens`. Fix transition timing on Accordion, Avatar, AvatarGroup, Badge, Breadcrumb and Tabs, whose `duration-*` classes generated no CSS in Tailwind v4.
