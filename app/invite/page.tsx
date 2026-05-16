import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function InvitePage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    redirect("/");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true }
  });

  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-neutral-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 max-w-md w-full">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-[13px] text-gray-500 mb-6">This invitation link is invalid or has already been used.</p>
          <Button  className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (invitation.expires < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-neutral-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 max-w-md w-full">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Invitation Expired</h1>
          <p className="text-[13px] text-gray-500 mb-6">This invitation link has expired.</p>
          <Button className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(`/invite?token=${token}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  // Handle Accept Action
  async function acceptInvitation() {
    "use server";
    
    // verify again in server action
    const inv = await prisma.invitation.findUnique({ where: { token } });
    if (!inv || inv.expires < new Date()) {
      redirect("/");
    }

    const userId = session!.user!.id;

    await prisma.$transaction([
      prisma.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: userId,
            organizationId: inv.organizationId,
          }
        },
        create: {
          userId: userId,
          organizationId: inv.organizationId,
          role: inv.role,
        },
        update: {
          role: inv.role,
        }
      }),
      prisma.invitation.delete({
        where: { id: inv.id }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { activeOrgId: inv.organizationId }
      })
    ]);

    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-black/5">
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] mb-2">
          You've been invited!
        </h1>
        <p className="text-[14px] text-[#737373] mb-8 leading-relaxed">
          You have been invited to join <span className="font-bold text-black">{invitation.organization.name}</span> as a <span className="font-bold text-black">{invitation.role.toLowerCase()}</span>.
        </p>

        <form action={acceptInvitation}>
          <Button type="submit" className="w-full h-12 text-[14px] font-bold bg-black text-white hover:bg-neutral-800 transition-colors">
            Accept Invitation
          </Button>
        </form>
        
        <p className="text-[12px] text-[#A3A3A3] mt-6">
          Logged in as {session.user.email}
        </p>
      </div>
    </div>
  );
}
