/* Hover classes bound themselves to a node
 */
class GitHubHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
        this.parser = new DOMParser();
    }

    checkLinkType() {
        if (this.CURRENT_TAB == 'github.com' || this.redirectLink.match(/(github.com)\/[\w]{1,256}\/[\w]{1,256}\/[\w]/g)) return 'unknown';
        else if (this.redirectLink.match(/(github.com)\/[\w]{1,256}\/[\w]{1,256}/g)) return 'repo';
        else return 'profile';
    }

    /* bindToContainer
     * Parameters :
     * node - {HTMLNodeElement} - An anchor link element
     * domain - {String} - The domain of the current webpage
     * container - {HTMLNodeElement} - The Linker container
     * 
     * This function is called to get the data from the link we
     * want to preview and then attach it to the container
     * Note: data is always inserted into textNodes to avoid
     * malicious script injections.
     */
    bindToContainer(node, domain, container) {
        if (this.linkType == 'profile') {

            const username = this.redirectLink.split('github.com/')[1];

            window
                .LinkerBackgroundRequest(`https://api.github.com/users/${username}`)
                .then(({ data }) => {

                    let githubContainer = document.createElement('div');
                    githubContainer.className = 'Linker-github-container';

                    let githubProfileContainer = document.createElement('div');
                    githubProfileContainer.id = 'Linker-github-profile';

                    let profilePic = document.createElement('img');
                    profilePic.id = 'Linker-github-avatar';
                    profilePic.src = data.avatar_url;
                    profilePic.style.width = '80px';
                    githubProfileContainer.appendChild(profilePic);

                    let profInfo = document.createElement('div');
                    profInfo.id = 'Linker-github-user-info';

                    profInfo.style = 'display: inline-block';

                    let name = document.createElement('span');
                    name.className = 'Linker-github-name';
                    name.appendChild(document.createTextNode(data.name || data.login));

                    let githubAt = document.createElement('span');
                    githubAt.className = 'Linker-github-at';
                    githubAt.appendChild(document.createTextNode(` @${data.login}`));

                    let bio = document.createElement('span');
                    bio.className = 'Linker-github-bio';
                    bio.appendChild(document.createTextNode(data.bio ? data.bio : ''));

                    profInfo.appendChild(name);
                    profInfo.appendChild(githubAt);
                    profInfo.appendChild(bio);

                    githubProfileContainer.appendChild(profInfo);

                    let profStats = document.createElement('div');
                    profStats.className = 'Linker-github-profile-stats';

                    let statdata = [{ 'name': 'Repos', 'stat': data.public_repos },
                        { 'name': 'Followers', 'stat': data.followers },
                        { 'name': 'Following', 'stat': data.following }];

                    statdata.forEach((x) => {
                        let stat = document.createElement('a');
                        stat.className = 'Linker-github-profile-stat';

                        let statNumber = document.createElement('b');
                        statNumber.className = 'Linker-github-prof-stat-val';
                        statNumber.appendChild(document.createTextNode(x.stat));
                        let statName = document.createElement('span');
                        statName.className = 'Linker-github-prof-stat-name';
                        statName.appendChild(document.createTextNode(x.name));

                        stat.appendChild(statNumber);
                        stat.appendChild(statName);

                        profStats.appendChild(stat);
                    });


                    githubProfileContainer.appendChild(profStats);

                    let githubLinksContainer = document.createElement('div');
                    githubLinksContainer.className = 'Linker-github-links';

                    let links = [{ 'name': 'Workplace: ', 'link': data.company ? data.company : 'not available' },
                        { 'name': 'Twitter: ', 'link': data.twitter_username ? '@' + data.twitter_username : 'not available' },
                        { 'name': 'Website: ', 'link': data.blog ? data.blog : 'not available' }];

                    links.forEach((link) => {
                        let linkContainer = document.createElement('div');

                        let linkName = document.createElement('span');
                        linkName.appendChild(document.createTextNode(link.name));
                        linkName.className = 'Linker-github-link';

                        linkContainer.appendChild(linkName);

                        let linkText = document.createElement('span');
                        linkText.appendChild(document.createTextNode(link.link));

                        if (link.link.includes('not available')) {
                            linkText.className = 'Linker-github-link empty';
                        } else {
                            linkText.className = 'Linker-github-link';
                        }

                        linkContainer.appendChild(linkText);

                        githubLinksContainer.appendChild(linkContainer);
                    })

                    githubProfileContainer.appendChild(githubLinksContainer);

                    githubContainer.appendChild(githubProfileContainer);

                    if (window.lastHovered == node && container.innerHTML == '') {
                        container.appendChild(githubContainer);
                    }
                })
                .catch(console.error);

        }
    }
}