
'use server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';
import { unstable_noStore as noStore } from 'next/cache';

export async function getSettings() {
    noStore();
    await dbConnect();
    try {
        const settingsArray = await Setting.find({}).lean();
        const settingsObject = settingsArray.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as { [key: string]: any });
        return settingsObject;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
}
