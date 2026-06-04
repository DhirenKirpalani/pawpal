import { NextRequest, NextResponse } from 'next/server';
import { ReminderNotifier } from '@/lib/notifications/reminder-notifier';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifier = new ReminderNotifier();
    
    await notifier.sendDueReminders();
    await notifier.sendFeedingReminders();

    return NextResponse.json({ 
      success: true, 
      message: 'Reminders sent successfully' 
    });
  } catch (error) {
    console.error('Error in reminder cron job:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}
