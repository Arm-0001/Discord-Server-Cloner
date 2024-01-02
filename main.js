import chalk from "chalk";
import gradient from "gradient-string";
import { Client } from "discord.js-selfbot-v13";
import redline from "readline";
import config from "./config.json";

const args = process.argv.slice(2);
const client = new Client({ checkUpdate: false });
const token = config.token;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cloneChannels = async (guild, newGuild) => {
  const channels = guild.channels.cache.map((channel) => channel);
  channels.sort((a, b) => {
    if (a.type === "GUILD_CATEGORY") return -1;
    if (b.type === "GUILD_CATEGORY") return 1;
    return 0;
  });
  console.log(
    chalk.green(
      `[INFO] Found categories ${
        channels.filter((channel) => channel.type === "GUILD_CATEGORY").length
      }, text channels ${
        channels.filter((channel) => channel.type === "GUILD_TEXT").length
      }, and voice channels ${
        channels.filter((channel) => channel.type === "GUILD_VOICE").length
      }`
    )
  );
  const categories = channels.filter(
    (channel) => channel.type === "GUILD_CATEGORY"
  );
  const textChannels = channels.filter(
    (channel) => channel.type === "GUILD_TEXT",
    (channel) => channel.name.toLowerCase().includes("ticket-")
  );
  const voiceChannels = channels.filter(
    (channel) => channel.type === "GUILD_VOICE"
  );

  // associate the channels with their parent category
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    if (channel.parentID) {
      const parent = categories.find(
        (category) => category.id === channel.parentID
      );
      channel.parent = parent;
    }
  }

  // create the categories
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    try {
      await newGuild.channels.create(category.name, {
        type: category.type,
        position: category.position,
        permissionOverwrites: category.permissionOverwrites.cache,
      });
      console.log(chalk.green("[INFO] Created category " + category.name));
    } catch (error) {
      console.log(
        chalk.red("[ERROR] Failed to create category " + category.name)
      );
    }
  }

  // create the text channels
  for (let i = 0; i < textChannels.length; i++) {
    const channel = textChannels[i];
    // skip tickets
    if (channel.name.toLowerCase().includes("ticket")) {
      continue;
    } else {
      try {
        const parent = channel.parent
          ? newGuild.channels.cache.find(
              (newChannel) => newChannel.name === channel.parent.name
            )
          : null;
        await newGuild.channels.create(channel.name, {
          type: channel.type,
          position: channel.position,
          permissionOverwrites: channel.permissionOverwrites.cache,
          parent: parent,
        });
        console.log(chalk.green("[INFO] Created text channel " + channel.name));
      } catch (error) {
        console.log(
          chalk.red("[ERROR] Failed to create text channel " + channel.name)
        );
      }
    }
  }

  // create the voice channels
  for (let i = 0; i < voiceChannels.length; i++) {
    const channel = voiceChannels[i];
    try {
      const parent = channel.parent
        ? newGuild.channels.cache.find(
            (newChannel) => newChannel.name === channel.parent.name
          )
        : null;
      await newGuild.channels.create(channel.name, {
        type: channel.type,
        position: channel.position,
        permissionOverwrites: channel.permissionOverwrites.cache,
        parent: channel.parent,
      });
      console.log(chalk.green("[INFO] Created voice channel " + channel.name));
    } catch (error) {
      console.log(
        chalk.red("[ERROR] Failed to create voice channel " + channel.name)
      );
    }
  }

  // set the channel positions
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    try {
      await newGuild.channels.cache
        .find((newChannel) => newChannel.name === channel.name)
        .setPosition(channel.position);
      console.log(
        chalk.green(
          "[INFO] Set position of " + channel.name + " to " + channel.position
        )
      );
    } catch (error) {
      console.log(
        chalk.red(
          "[ERROR] Failed to set position of " +
            channel.name +
            " to " +
            channel.position
        )
      );
    }
  }
};

const cloneRoles = async (guild, newGuild) => {
  const roles = guild.roles.cache.map((role) => role);
  console.log(chalk.green("[INFO] Found " + roles.length + " roles"));
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    await newGuild.roles.create({
      name: role.name,
      color: role.color,
      hoist: role.hoist,
      permissions: role.permissions,
      mentionable: role.mentionable,
    });
    await sleep(100);
    console.log(
      chalk.green(
        `[INFO] Created role ${role.name} with color ${role.color} and permissions ${role.permissions}`
      )
    );
  }
};

const cloneEmojis = async (guild, newGuild) => {
  const emojis = guild.emojis.cache.map((emoji) => emoji);
  for (let i = 0; i < emojis.length; i++) {
    const emoji = emojis[i];
    await newGuild.emojis.create(emoji.url, emoji.name);
  }
};

const cloneGuild = async (guild) => {
  if (args[0] != undefined) {
    const oldGuildID = args[0];
    const newGuildID = args[1];
    if (oldGuildID === newGuildID) {
      console.log(
        chalk.red(
          "[ERROR] The old guild ID and the new guild ID must be different"
        )
      );
      return false;
    } else if (oldGuildID === undefined || newGuildID === undefined) {
      console.log(
        chalk.red(
          "[ERROR] You must provide both the old guild ID and the new guild ID"
        )
      );
      return false;
    } else {
      console.log(
        chalk.green("[INFO] Copying server " + oldGuildID + " to " + newGuildID)
      );
      const oldGuild = await client.guilds.fetch(oldGuildID);
      const newGuild = await client.guilds.fetch(newGuildID);
      const categorys = newGuild.channels.cache.filter(
        (channel) => channel.type === "GUILD_CATEGORY"
      );
      const tier1 = "1177977070572277810";
      const tier2 = "1177977069645340704";
      const tier3 = "1177977071570538496";
      const premium = "1177977066214408273";
      const ticketChannel = "1177978434522185778";
      const channels = newGuild.channels.cache.map((channel) => channel);
      const tier1Channels = [];
      const tier2Channels = [];
      const tier3Channels = [];
      const premiumChannels = [];
      const tier1Webhooks = [];
      const tier2Webhooks = [];
      const tier3Webhooks = [];
      const premiumWebhooks = [];
      const tier1Role = newGuild.roles.cache.find((role) =>
        role.name.toLowerCase().includes("tier 1")
      );
      const tier2Role = newGuild.roles.cache.find((role) =>
        role.name.toLowerCase().includes("tier 2")
      );
      const tier3Role = newGuild.roles.cache.find((role) =>
        role.name.toLowerCase().includes("tier 3")
      );
      const premiumRole = newGuild.roles.cache.find((role) =>
        role.name.toLowerCase().includes("premium")
      );
      const tiermessage = `To access this category, you must purchase <@&[roleid]>  rank - <#${ticketChannel}>`;
      console.log(`there are ${channels.length} channels`);
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        console.log(
          ` [INFO] Checking channel ${channel.parentId}, ${tier1}, ${tier2}, ${tier3}, ${premium}`
        );
        if (channel.parentId === tier1) {
          tier1Channels.push(channel);
        }
        if (channel.parentId === tier2) {
          tier2Channels.push(channel);
        }
        if (channel.parentId === tier3) {
          tier3Channels.push(channel);
        }
        if (channel.parentId === premium) {
          premiumChannels.push(channel);
        }
      }
      console.log(
        `there are ${tier1Channels.length} tier 1 channels, ${tier2Channels.length} tier 2 channels, ${tier3Channels.length} tier 3 channels and ${premiumChannels.length} premium channels`
      );
      // Define tiers and their respective channels and roles
      const tiers = [
        { name: "Tier 1", channels: tier1Channels, role: tier1Role },
        { name: "Tier 2", channels: tier2Channels, role: tier2Role },
        { name: "Tier 3", channels: tier3Channels, role: tier3Role },
        { name: "Premium", channels: premiumChannels, role: premiumRole },
      ];

      // Iterate over each tier
      for (const tier of tiers) {
        // Create webhooks for each channel in the tier and send message
        for (const channel of tier.channels) {
          try {
            // create a webhook with pfp
            const webhook = await channel.createWebhook("Lust", {
              avatar:
                "https://i.pinimg.com/736x/95/20/74/952074601e07c9b78548298a4588d8c3.jpg",
            });
            console.log(
              `[INFO] Created webhook for channel ${channel.name} in guild ${channel.guild.name}`
            );
            const message = tiermessage
              .replace("[roleid]", tier.role.id)
              .replace("[channelid]", webhook.channelId);
            await webhook.send(message);
          } catch (error) {
            console.error(`Error in channel ${channel.id}: ${error.message}`);
          }
        }
      }

      console.log(
        chalk.green(
          "[SUCCESS] Copied server " + oldGuildID + " to " + newGuildID
        )
      );
    }
  } else {
    const newGuild = await client.guilds.create(
      guild.name,
      guild.region,
      guild.iconURL(),
      guild.systemChannel
    );
    console.log(chalk.green("[INFO] Created server " + guild.name));
    // delet the default channels categories and voice channels
    const channels = newGuild.channels.cache.map((channel) => channel);
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      await channel.delete();
      console.log(chalk.green("[INFO] Deleted channel " + channel.name));
    }
    await cloneChannels(guild, newGuild);
    await cloneRoles(guild, newGuild);
    await cloneEmojis(guild, newGuild);
    console.log(chalk.green("[SUCCESS] Cloned server " + guild.name));
    return newGuild;
  }
};

client.on("ready", async () => {
  console.log(
    chalk.green("[INFO] Logged in as ") + gradient.cristal(client.user.tag)
  );
  // if args then run the clone function
  if (args[0] && args[1]) {
    const [oldGuildID, newGuildID] = args;
    const oldGuild = await client.guilds.fetch(oldGuildID);
    await cloneGuild(oldGuild, args, client);
    return;
  }
  const servers = client.guilds.cache.map((guild) => guild.name);
  console.log(chalk.green("[INFO] Found " + servers.length + " servers"));
  console.log(chalk.green("[INFO] Select a server to clone"));
  for (let i = 0; i < servers.length; i++) {
    console.log(chalk.green("[INFO] [" + i + "] " + servers[i]));
  }
  const readline = redline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readline.question(
    chalk.green("[INFO] Select a server to clone: "),
    async (server) => {
      readline.close();
      //get the server
      const guild = client.guilds.cache.find(
        (guild) => guild.name === servers[server]
      );
      const channels = guild.channels.cache.map((channel) => channel.name);
      console.log(chalk.green("[INFO] Found " + channels.length + " channels"));
      // clone everything about the server except messages
      console.log(chalk.green("[INFO] Cloning server"));
      await cloneGuild(guild, args, client);
      console.log(chalk.green("[INFO] Server cloned"));
    }
  );
});

const main = async () => {
  console.log(gradient.rainbow("Welcome to Discord Server cloner by Arm"));
  await client.login(token);
};

process.on("unhandledRejection", (reason, promise) => {
  console.log(
    `${chalk.redBright(
      "[ERROR]"
    )} Unhandled rejection at ${promise}, reason: ${reason}`
  );
  console.log(reason);
});

process.on("uncaughtException", (err, origin) => {
  console.log(
    `${chalk.redBright("[ERROR]")} Uncaught exception: ${err} at ${origin}}`
  );
  console.log(err);
});

main();
