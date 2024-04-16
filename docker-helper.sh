echo 'GOGFMC Development Platform' ;

while true; do
  echo 'List of actions';
  echo '[1] Start application';
  echo '[2] Start application (clear volumes)';
  echo '[3] Run migration';
  echo '[4] Stop application';
  echo '[5] Get into workspace';
  echo 'E[x]it';
  read -p 'Option: ' option
  case $option in
    1 )
      docker-compose down && docker-compose up -d
      docker-compose exec workspace bash -c "composer update -o"
      docker-compose exec workspace bash -c "npm update"
      docker-compose exec workspace bash -c "npm audit fix --force"
      docker-compose exec workspace bash -c "npm run build"
      break;;
    2 )
      docker-compose down -v && docker-compose up -d
      docker-compose exec workspace bash -c "composer update -o"
      docker-compose exec workspace bash -c "npm update"
      docker-compose exec workspace bash -c "npm audit fix --force"
      docker-compose exec workspace bash -c "npm run build"
      break;;
    3 )
      docker-compose exec workspace bash -c "php artisan migrate"
      break;;
    4 )
      docker-compose down
      break;;
    5 )
      docker-compose exec workspace bash
      break;;
    [Xx] )
      exit;;
  esac
done
