import { Suspense } from "react"
import RequestQuoteClient from "./RequestQuoteClient"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <RequestQuoteClient />
        </Suspense>
    )
}