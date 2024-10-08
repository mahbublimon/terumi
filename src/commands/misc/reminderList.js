const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder-list')
    .setDescription('List all your active reminders'),

  async execute(interaction) {
    const userReminders = reminders.get(interaction.user.id);

    if (!userReminders) {
      return interaction.reply({ content: 'You have no active reminders!', ephemeral: true });
    }

    return interaction.reply(`You have a reminder set: **${userReminders.reminderMessage}** in ${ms(userReminders.timeMs - (Date.now() - userReminders.createdAt))}`);
  },
};
