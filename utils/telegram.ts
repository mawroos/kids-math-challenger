export const sendTelegramNotification = async (message: string) => {
  const token = '8748896099:AAFKPCIMg_9espQ65cKXYlzR83jGieLp1nY';
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '680440122';

  if (!chatId) {
    console.warn('Telegram Chat ID not configured. Please set VITE_TELEGRAM_CHAT_ID in .env.local');
    return;
  }
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send Telegram notification', error);
  }
};

export const formatTestResults = (testType: string, score: number, total: number, timeSeconds?: number, playerName?: string, missed?: number) => {
  const hostname = window.location.hostname || 'Unknown Host';
  const platform = navigator.platform || 'Unknown Platform';
  const userAgent = navigator.userAgent;
  
  // Extract browser info for a cleaner device string
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let timeString = '';
  if (timeSeconds !== undefined) {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;
    timeString = `\n⏱ <b>Time:</b> ${minutes}m ${seconds}s`;
  }

  const percentage = Math.round((score / total) * 100) || 0;
  
  let emoji = '✅';
  if (percentage < 50) emoji = '⚠️';
  if (percentage >= 90) emoji = '🌟';

  const playerString = playerName ? `\n👤 <b>Player:</b> ${playerName}` : '';
  const missedString = (missed !== undefined && missed > 0) ? `\n❓ <b>Missed:</b> ${missed} ${missed === 1 ? 'question' : 'questions'}` : '';

  return `
🎯 <b>Test Completed!</b>${playerString}
<b>Type:</b> ${testType}
${emoji} <b>Score:</b> ${score} / ${total} (${percentage}%) ${timeString}${missedString}

📱 <b>Device Info:</b>
• Hostname: ${hostname}
• Platform: ${platform}
• Browser: ${browser}
`.trim();
};
