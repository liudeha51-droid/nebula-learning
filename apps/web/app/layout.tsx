import type {Metadata} from 'next';
import {THEME_BOOT_SCRIPT} from '@/lib/themes';
import './globals.css';
import './themes.css';
import 'katex/dist/katex.min.css';
export const metadata:Metadata={title:'Nebula Learning · Your next discovery',description:'Evidence-led mathematics and physics learning. Explore, understand, connect.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:THEME_BOOT_SCRIPT}}/></head><body>{children}</body></html>}
