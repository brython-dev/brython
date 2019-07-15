set -xe

DEST=../cs1-v2/frontend/src/brython

(cd scripts && pipenv run python make_dist.py)

rm -rf "$DEST"
mkdir "$DEST"
cp -r www/src/brython.js www/src/brython_stdlib.js setup "$DEST"
cp -r www/src/libs www/src/Lib "$DEST/../../public/"

git log -n 1 --pretty=format:"%H" > $DEST/git-sha.txt

# Remove files that we don't need
rm -rf "$DEST/setup/data" "$DEST/Lib/test" "$DEST/setup/changelog.txt" \
  "$DEST/Lib/.bundle-ignore" "$DEST/Lib/email/architecture.rst"
