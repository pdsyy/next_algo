import { NextRequest, NextResponse } from 'next/server';
import { shopSessionByToken, publicShopSession } from '@/lib/tribute-shop';
import { sessionByToken } from '@/lib/tribute';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const headers = {'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer /,'') ?? '';
    const s = await shopSessionByToken(token);
    if (!s) {
      const legacy = await sessionByToken(token);
      if (!legacy) return NextResponse.json({success:false},{status:404,headers});
      const state = ['created','bound'].includes(legacy.state) ? 'legacy' : legacy.state;
      return NextResponse.json({success:true,state,session:{token,orderCode:legacy.order_code,
        testMode:legacy.test_mode,paymentUrl:null,state}},{headers});
    }
    return NextResponse.json({success:true,state:s.state,session:publicShopSession(s)},{headers});
  } catch { return NextResponse.json({success:false},{status:503,headers}); }
}
