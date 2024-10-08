document.addEventListener('DOMContentLoaded', () => {
  const serversElement = document.getElementById('servers');
  const usersElement = document.getElementById('users');
  const cachedUsersElement = document.getElementById('cachedUsers');
  const channelsElement = document.getElementById('channels');
  const messagesPerMinuteElement = document.getElementById('messagesPerMinute');
  const uptimeElement = document.getElementById('uptime');
  const profileElement = document.getElementById('profile');

  // Fetch bot statistics from the server
  function fetchStats() {
    fetch('/api/stats')
      .then(response => response.json())
      .then(data => {
        serversElement.textContent = data.servers || 'N/A';
        usersElement.textContent = data.users || 'N/A';
        cachedUsersElement.textContent = data.cachedUsers || 'N/A';
        channelsElement.textContent = data.channels || 'N/A';
        messagesPerMinuteElement.textContent = data.messagesPerMinute || 'N/A';
        uptimeElement.textContent = formatUptime(data.uptime || 0);
      })
      .catch(err => console.error('Error fetching stats:', err));
  }

  // Format uptime in a readable format (e.g., HH:MM:SS)
  function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }

  // Fetch the authentication status and update the profile button
  function fetchAuthStatus() {
    fetch('/auth/status')
      .then(response => response.json())
      .then(data => {
        if (data.loggedIn) {
          profileElement.textContent = `Logged in as ${data.user.username}`;
          profileElement.href = '/auth/logout'; // Change link to logout if logged in
        } else {
          profileElement.textContent = 'Login with Discord';
          profileElement.href = '/auth/discord'; // Set login link if not logged in
        }
      })
      .catch(err => console.error('Error fetching auth status:', err));
  }

  // Initial fetch for stats and authentication status
  fetchStats();
  fetchAuthStatus();

  // Update stats every 15 seconds
  setInterval(fetchStats, 15000);
});
