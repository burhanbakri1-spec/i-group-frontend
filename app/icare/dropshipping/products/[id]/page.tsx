import { Product } from '../../client'; export default async function Page({params}:{params:Promise<{id:string}>}){return <Product id={(await params).id}/>}
