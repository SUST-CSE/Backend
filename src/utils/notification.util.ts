import { User } from '@/modules/user/user.schema';
import { sendEmail } from './email.util';
import { env } from '@/config/env';

export const notifyInterestedUsers = async (
  type: 'notice' | 'event',
  category: string,
  contentData: { title: string; id: string }
) => {
  console.log(`🔔 Notification Triggered: [${type.toUpperCase()}] Category: ${category}, Title: ${contentData.title}`);
  try {
    // Find users who have opted into this category
    const filter: any = { isDeleted: false, isEmailVerified: true };
    if (type === 'notice') {
      filter['notificationPreferences.notices'] = category;
    } else {
      filter['notificationPreferences.events'] = category;
    }

    console.log('🔍 Looking for users with filter:', JSON.stringify(filter));
    const users = await User.find(filter).select('email name');
    
    console.log(`👥 Found ${users.length} match(es) for this notification.`);
    
    if (users.length === 0) {
      console.log('⏹️ No users found to notify for this category.');
      return { success: 0, total: 0, notifiedEmails: [] };
    }

    const typeLabel = type === 'notice' ? 'Notice' : 'Event';
    const link = `${env.CLIENT_URL}/${type}s/${contentData.id}`;

    console.log('✉️ Starting email blast...');
    const emailPromises = users.map(async (user) => {
      try {
        const result = await sendEmail({
          to: user.email,
          subject: `New ${typeLabel}: ${contentData.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #002147; margin-bottom: 20px;">New ${typeLabel} Published</h2>
              <p>Hello ${user.name},</p>
              <p>A new <strong>${typeLabel}</strong> in the category <strong>${category}</strong> has been published on the SUST CSE website.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #0f172a;">${contentData.title}</h3>
                <a href="${link}" style="display: inline-block; background-color: #002147; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">View Full Details</a>
              </div>
              
              <p style="color: #64748b; font-size: 0.875rem;">
                You are receiving this because you opted for notifications in this category. 
                You can change your preferences anytime in your dashboard settings.
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 0.75rem; color: #94a3b8; text-align: center;">
                SUST CSE Department <br/>
                Sylhet-3114, Bangladesh
              </p>
            </div>
          `
        });
        console.log(`  ✅ Email sent to: ${user.email} (ID: ${result.messageId})`);
        return result;
      } catch (err: any) {
        console.error(`  ❌ Failed to notify ${user.email}:`, err.message);
        throw err;
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`🏁 Notification process finished. Success: ${successCount}/${users.length}`);
    
    return {
      success: successCount,
      total: users.length,
      notifiedEmails: users.map(u => u.email)
    };
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    return { success: 0, total: 0, error: 'Internal notification error' };
  }
};
