#!/bin/sh
echo -e "Deploying to ${DESTINATION}"
rsync -av -e ssh --cvs-exclude --exclude=".idea" --exclude=".gitignore" --exclude="README.md" --exclude="scripts" . $DESTINATION
