import { Order } from '../../client'; export default async function Page({params}:{params:Promise<{id:string}>}){return <Order id={(await params).id}/>}
