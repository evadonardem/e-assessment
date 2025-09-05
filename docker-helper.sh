echo 'Development Platform';
while true; do
  echo 'List of actions';
  echo '[1] Start application';
  echo '[2] Start application (clear volumes)';
  echo '[3] Stop application';
  echo '[4] Get into workspace';
  echo 'E[x]it';
  read -p 'Option: ' option
  case $option in
    1 )
      docker-compose down && docker-compose pull && docker-compose up -d
      docker-compose exec workspace bash -c "composer update -o"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && ncu && ncu -u"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && npm update"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && npm audit fix"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && npm run build"
      break;;
    2 )
      docker-compose down -v && docker-compose pull && docker-compose up -d
      docker-compose exec workspace bash -c "composer update -o"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && ncu && ncu -u"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && npm update"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && npm audit fix"
      docker-compose exec workspace bash -c "source /usr/local/nvm/nvm.sh && npm run build"
      break;;
    3 )
      docker-compose down
      break;;
    4 )
      docker-compose exec workspace bash
      break;;
    [Xx] )
      exit;;
  esac
done
