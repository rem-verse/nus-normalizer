# NUS Normalizer #

A small middleware script for NUS style CDNs on Backblaze proxying through Bunny.net
that will allow CDNs to act like the official nintendo CDN, while still only
storing the data once:

1. All title ids/filenames are implicitly lowercased.
2. `/ccs/download/`  path prefix is stripped if present.

This assumes your original storage location is just `<title id lowercased>/<file name lowercased>`.
This script will also do all of this without requiring your clients to follow
redirects.

***This script does assume a private Backblaze b2 bucket is your backend.***

## Deploying Yourself ##

### Configuring Github Deployments ###

First we need to hook up GitHub to Bunny. You could do a one-off deploy, but
in general it's much easier to hook the two up. Unfortunately, GitHub actions
can't really run from forks, and we don't want you deploying to my account
anyway. So we'll be making a copy of this repository.

1. Create a new GitHub repo in whatever org you want your copy + deployment to live.
2. Download this repository, remove the `.git` folder if one is present, and point it at your new repo.
  - A blank GitHub repo should have instructions on how to push a codebase with existing code to your new repo.
3. Update your actions secrets: "BUNNY_SCRIPT_ID", and "BUNNY_DEPLOYMENT_SECRET".
4. Trigger a run of the action.

Congrats! Your Bunny script should now be deployed and hooked up to GitHub.

### Bunny <-> Backblaze ###

By the time we get the request Bunny has signed the request for us, but for the
path the user requested. As part of 'normalizing' we may need to change the
path to fetch from in Backblaze. Unfortunately, Bunny just won't resign for us.
We need to do the signing ourselves in our middleware.

In order to do that our script itself performs Signing to talk to your private
B2 Bucket, but _only when the path has changed_. In order to sign we need
access to the B2 Credentials in order to sign the request.

Since this middleware can be attached to multiple domains, and such at once
this script will look for the following environment variables in order to
resign properly:

- `${BUCKET_NAME_UPPERCASE_WITH_DASHES_REPLACED_WITH_UNDERSCORES}_B2_APPLICATION_KEY_ID`
- `${BUCKET_NAME_UPPERCASE_WITH_DASHES_REPLACED_WITH_UNDERSCORES}_B2_APPLICATION_KEY`

e.g. if your bucket was called: `nintendo-prod-cdn-pdx` you'd have the following
environment secrets configured in your script:

- `NINTENDO_PROD_CDN_PDX_B2_APPLICATION_KEY_ID`
- `NINTENDO_PROD_CDN_PDX_B2_APPLICATION_KEY`

You can repeat these secret creations for as many buckets as you want this
script to access. The B2 Application Keys only need to be read only, and don't
need to be able to list all the buckets or anything else.
