require 'json'
require 'base64'
require_relative 'websocket'
require_relative 'desktop_entry'
require_relative File.join(ENV['CREW_PREFIX'] || '/usr/local', 'lib/crew/lib/const')

$LOAD_PATH << CREW_LIB_PATH

@device = JSON.load_file( File.join(CREW_CONFIG_PATH, 'device.json'), symbolize_names: true )

all_installed_apps = @device[:installed_packages].map do |pkg|
  require_relative File.join(CREW_PACKAGES_PATH, "#{pkg}.rb")
  pkg = Object.const_get( pkg[:name].capitalize )

  desktop_entry_file = File.readlines( File.join(CREW_META_PATH, "#{pkg[:name]}.filelist"), chomp: true ).select {|f| File.fnmatch?('*.desktop', f) } [0]

  entry = DesktopEntry.new(desktop_entry_file)

  {
    name: pkg[:name],
    version: pkg[:version],
    description: pkg[:description],
    icon_base64: Base64.encode64( File.read( entry.getIconPath || '/dev/null' ) )
  }
end

JSON.parse(all_installed_apps)