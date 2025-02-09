import { SITE_TITLE } from "./consts"

export default function siteName(title: string): string {
    return `${title} - ${SITE_TITLE}`
}
