Megaverse
----

Megaverses are 2D spaces comprised of combinations of different astral objects: 🪐POLYanets with 🌙SOLoons around them and ☄comETHs floating around.

## Implementation details:

1. The process continuously listens for user-input for valid commands.
   - Available commands: `add, remove, validate, create_goal, reset, exit`
2. Implemented axiosRetryRequestWithExponentialBackoff, helps when rate limited. Defaults to 5 retries.
3. The user can always restart the Megaverse to see it's state

## Start the Megaverse

```bash
# only need to run once
pnpm install

# only need to run once per terminal
# set the candidateId to check YOUR megaverse map state and interact with it.
export CROSSMINT_CANDIDATE_ID=<your_candidate_id>

# start megaverse
pnpm run start
```

Some of the commands that you can run after starting the Megaverse:

```bash
# [ACTION]
validate

# [ACTION][space][ASTRAL_OBJECT_NAME][space][ROW][space][COLUMN]
add UP_COMETH 0 0
validate

remove COMETH 0 0
validate

add BLUE_SOLOON 1 1
validate

remove SOLOON 1 1
validate

reset
create_goal
validate
```

## To-do/improvements

1. Need more validation.
   - Validate Soloon is only added around a Polyanet.
   - If a Polyanet is deleted, should it's Soloon be deleted?
2. User input validation can be more strict.
   - For invalid `add` command - it defaults to adding a Polyanet.
