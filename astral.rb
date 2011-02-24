require 'sinatra/base'
require 'haml'
require 'sinatra/static_assets'

class Astral < Sinatra::Base
  helpers Sinatra::UrlForHelper
  register Sinatra::StaticAssets

  set :app_file, __FILE__
  set :title, "Astral"

  get '/' do
    haml :browse
  end

  get '/stream' do
    haml :stream
  end

  get '/download' do
    haml :download
  end

  get '/about' do
    haml :about
  end

  run! if app_file == $0
end
