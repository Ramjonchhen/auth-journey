"use client";
import UserNotes from "@/components/UserNotes";
import { useAuth } from "@/providers/authProvider";

export default function Dashboard() {
    const { userProfile } = useAuth();

    return (
        <div className="p-10 flex items-center flex-col gap-2">
            <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
            
            {userProfile ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border max-w-sm">
                    <p className="text-gray-600">Welcome back, <span className="font-semibold text-black">{userProfile.username}</span></p>
                    <p className="text-2xl font-bold text-green-600 mt-2">Balance: {userProfile.balance} {userProfile.currency}</p>
                </div>
            ) : (
                <p>No profile data available.</p>
            )}
            <UserNotes />
        </div>
    );
}
