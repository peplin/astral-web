require 'sinatra/base'
require 'haml'
require 'sinatra/static_assets'
require 'datamapper'

Dir["./models/*.rb"].each {|f| require f }

class Astral < Sinatra::Base
  helpers Sinatra::UrlForHelper
  register Sinatra::StaticAssets

  configure do
    set :app_file, __FILE__
    set :title, "Astral"
    DataMapper.setup(:default, (ENV["DATABASE_URL"] || "sqlite3:///#{Dir.pwd}/development.sqlite3"))
    DataMapper.auto_upgrade!
  end

  get '/' do
    @streams = Stream.all
    haml :browse
  end

  post '/streams' do
  end

  get '/stream/:id' do |id|
    @stream = Stream.get(id)
    raise Sinatra::NotFound if not @stream
    haml :stream
  end

  get '/upload' do
    haml :upload
  end

  get '/download' do
    haml :download
  end

  get '/about' do
    haml :about
  end

  not_found do
    haml :'404'
  end

  run! if app_file == $0
end
