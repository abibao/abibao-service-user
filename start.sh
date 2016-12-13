BASES="127.0.0.1:39000,127.0.0.1:39001"
OPTS=""

node src/base.js base0 39000 $BASES $OPTS &
sleep 1
node src/base.js base1 39001 $BASES $OPTS &
sleep 1
node src/service.js 8000 $BASES $OPTS &
sleep 1
