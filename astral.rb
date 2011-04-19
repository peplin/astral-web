require 'sinatra/base'
require 'haml'
require 'sinatra/static_assets'
require 'datamapper'
require 'rack/csrf'

Dir["./models/*.rb"].each {|f| require f }

class Astral < Sinatra::Base
  helpers Sinatra::UrlForHelper
  register Sinatra::StaticAssets

  helpers do
    def csrf_token
      Rack::Csrf.csrf_token(env)
    end

    def csrf_tag
      Rack::Csrf.csrf_tag(env)
    end
  end

  configure do
    set :app_file, __FILE__
    set :title, "Astral"
    DataMapper.setup(:default, (ENV["DATABASE_URL"] || "sqlite3:///#{Dir.pwd}/development.sqlite3"))
    DataMapper.auto_upgrade!

    use Rack::Session::Cookie, :secret => "769bee166fa932c1ee9bc4129a52d11a3a"
    use Rack::Csrf, :raise => true
  end

  get '/' do
    @streams = Stream.all
    haml :browse
  end

  post '/streams' do
    @stream = Stream.create(:network_uid => params[:title].downcase.sub(" ", "_"),
                            :title => params[:title],
                            :description => params[:description])
    redirect "/stream/#{@stream.id}"
  end

  get '/stream/:id' do |id|
    @stream = Stream.get(id)
    raise Sinatra::NotFound if not @stream
    haml :stream
  end

  get '/nodes', :provides => 'json' do
    content_type :json
    Node.all.to_json
  end

  post '/nodes' do
    request.body.rewind
    data = JSON.parse request.body.read
    Node.create(:ip_address => request.ip)
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
