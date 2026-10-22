import type {Metadata} from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
export const metadata:Metadata={title:'Nebula Learning · Your next discovery',description:'Evidence-led mathematics and physics learning. Explore, understand, connect.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
